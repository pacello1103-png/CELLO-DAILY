import Foundation
import Network

/// A tiny HTTP server on 127.0.0.1 that serves the bundled web app and the
/// imported files. Serving from http://127.0.0.1 makes the page a "secure
/// context", so the microphone (tuner) works inside the web view.
final class LocalServer {
    let port: UInt16
    private let roots: [URL]
    private var listener: NWListener?
    private let queue = DispatchQueue(label: "dailycello.server")

    init(port: UInt16, roots: [URL]) {
        self.port = port
        self.roots = roots
    }

    func start(ready: @escaping (Bool) -> Void) {
        do {
            let params = NWParameters.tcp
            params.allowLocalEndpointReuse = true
            params.requiredInterfaceType = .loopback
            guard let nwPort = NWEndpoint.Port(rawValue: port) else { ready(false); return }
            let l = try NWListener(using: params, on: nwPort)
            l.newConnectionHandler = { [weak self] conn in self?.handle(conn) }
            var reported = false
            l.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    if !reported { reported = true; DispatchQueue.main.async { ready(true) } }
                case .failed(_):
                    if !reported { reported = true; DispatchQueue.main.async { ready(false) } }
                default: break
                }
            }
            l.start(queue: queue)
            listener = l
        } catch {
            ready(false)
        }
    }

    func stop() { listener?.cancel(); listener = nil }

    private func handle(_ conn: NWConnection) {
        conn.start(queue: queue)
        receive(conn, buffer: Data())
    }

    private func receive(_ conn: NWConnection, buffer: Data) {
        conn.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, _, isComplete, error in
            guard let self = self else { return }
            var buf = buffer
            if let d = data { buf.append(d) }
            if let range = buf.range(of: Data("\r\n\r\n".utf8)) {
                let head = String(decoding: buf.subdata(in: buf.startIndex..<range.lowerBound), as: UTF8.self)
                self.respond(conn, head: head)
            } else if isComplete || error != nil || buf.count > 1_000_000 {
                conn.cancel()
            } else {
                self.receive(conn, buffer: buf)
            }
        }
    }

    private func respond(_ conn: NWConnection, head: String) {
        let firstLine = head.components(separatedBy: "\r\n").first ?? ""
        let parts = firstLine.split(separator: " ")
        var path = parts.count > 1 ? String(parts[1]) : "/"
        if let q = path.firstIndex(of: "?") { path = String(path[..<q]) }
        if let h = path.firstIndex(of: "#") { path = String(path[..<h]) }
        path = path.removingPercentEncoding ?? path
        if path == "/" || path.isEmpty { path = "/index.html" }
        let clean = path.split(separator: "/").filter { $0 != ".." && $0 != "." }.joined(separator: "/")

        var body: Data? = nil
        var type = "application/octet-stream"
        for root in roots {
            let url = root.appendingPathComponent(clean)
            if url.standardizedFileURL.path.hasPrefix(root.standardizedFileURL.path),
               let d = try? Data(contentsOf: url) {
                body = d
                type = LocalServer.mime(url.pathExtension.lowercased())
                break
            }
        }
        var header: String
        let payload: Data
        if let b = body {
            header = "HTTP/1.1 200 OK\r\n"
            payload = b
        } else {
            header = "HTTP/1.1 404 Not Found\r\n"
            payload = Data("Not found".utf8)
            type = "text/plain"
        }
        header += "Content-Type: \(type)\r\nContent-Length: \(payload.count)\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n"
        var out = Data(header.utf8)
        out.append(payload)
        conn.send(content: out, completion: .contentProcessed { _ in conn.cancel() })
    }

    static func mime(_ ext: String) -> String {
        switch ext {
        case "html": return "text/html; charset=utf-8"
        case "js": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "woff2": return "font/woff2"
        case "pdf": return "application/pdf"
        case "xml", "musicxml": return "application/xml"
        case "mxl": return "application/vnd.recordare.musicxml"
        default: return "application/octet-stream"
        }
    }
}
