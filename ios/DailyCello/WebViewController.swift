import UIKit
import WebKit

final class WebViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var server: LocalServer?
    private var loaded = false
    private var pendingImports: [String] = []
    static let port: UInt16 = 47615

    private var inboxURL: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let inbox = docs.appendingPathComponent("inbox", isDirectory: true)
        try? FileManager.default.createDirectory(at: inbox, withIntermediateDirectories: true)
        return inbox
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.984, green: 0.973, blue: 0.953, alpha: 1)

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.add(self, name: "native")
        let isSelfTest = ProcessInfo.processInfo.arguments.contains("--selftest")
        let flag = "window.DC_NATIVE = true; window.DC_SELFTEST = \(isSelfTest ? "true" : "false");"
        config.userContentController.addUserScript(WKUserScript(source: flag, injectionTime: .atDocumentStart, forMainFrameOnly: true))

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = view.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.allowsBackForwardNavigationGestures = false
        if #available(iOS 16.4, *) { webView.isInspectable = true }
        view.addSubview(webView)

        let webRoot = Bundle.main.bundleURL.appendingPathComponent("web", isDirectory: true)
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let srv = LocalServer(port: WebViewController.port, roots: [webRoot, docs])
        server = srv
        srv.start { [weak self] ok in
            guard let self = self else { return }
            if ok {
                let q = isSelfTest ? "?selftest=1" : ""
                self.webView.load(URLRequest(url: URL(string: "http://127.0.0.1:\(WebViewController.port)/index.html\(q)")!))
            } else {
                // fallback: load from the bundle (microphone may be unavailable)
                self.webView.loadFileURL(webRoot.appendingPathComponent("index.html"), allowingReadAccessTo: webRoot)
            }
        }
    }

    override var prefersHomeIndicatorAutoHidden: Bool { true }

    // MARK: files opened with "Open in Daily Cello"
    func importFile(_ url: URL) {
        let access = url.startAccessingSecurityScopedResource()
        defer { if access { url.stopAccessingSecurityScopedResource() } }
        let name = url.lastPathComponent
        let dest = inboxURL.appendingPathComponent(name)
        try? FileManager.default.removeItem(at: dest)
        do {
            try FileManager.default.copyItem(at: url, to: dest)
        } catch {
            guard let d = try? Data(contentsOf: url) else { return }
            try? d.write(to: dest)
        }
        let rel = "inbox/" + (name.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? name)
        if loaded { deliver(rel, name: name) } else { pendingImports.append(rel + "\n" + name) }
    }

    private func deliver(_ rel: String, name: String) {
        let js = "window.DC_onNativeFile && window.DC_onNativeFile(\(jsString(rel)), \(jsString(name)));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    private func jsString(_ s: String) -> String {
        let data = try? JSONSerialization.data(withJSONObject: [s])
        let arr = data.flatMap { String(data: $0, encoding: .utf8) } ?? "[\"\"]"
        return String(arr.dropFirst().dropLast())
    }

    // MARK: WKNavigationDelegate
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loaded = true
        let list = pendingImports
        pendingImports.removeAll()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            for item in list {
                let p = item.components(separatedBy: "\n")
                if p.count == 2 { self.deliver(p[0], name: p[1]) }
            }
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url, let host = url.host,
           host != "127.0.0.1", url.scheme == "https" || url.scheme == "http" {
            UIApplication.shared.open(url)          // external links open in Safari
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    // MARK: WKUIDelegate
    @available(iOS 15.0, *)
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(a, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(a, animated: true)
    }

    // MARK: messages from the page
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        let text = body["text"] as? String ?? ""
        switch type {
        case "log":
            print("[web] \(text)")
        case "selftest":
            print(text)
            fflush(stdout)
            if body["done"] as? Bool == true {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) { exit(0) }
            }
        case "share":
            if let path = body["path"] as? String {
                let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let url = docs.appendingPathComponent(path)
                let vc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                vc.popoverPresentationController?.sourceView = view
                vc.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
                present(vc, animated: true)
            }
        default: break
        }
    }
}
