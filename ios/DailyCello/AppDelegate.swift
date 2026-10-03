import UIKit
import AVFoundation

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    let web = WebViewController()

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        configureAudio()
        let w = UIWindow(frame: UIScreen.main.bounds)
        w.rootViewController = web
        w.makeKeyAndVisible()
        window = w
        application.isIdleTimerDisabled = true   // the screen stays on while practising
        if let url = launchOptions?[.url] as? URL { web.importFile(url) }
        return true
    }

    func application(_ app: UIApplication, open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        web.importFile(url)
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    private func configureAudio() {
        let s = AVAudioSession.sharedInstance()
        do {
            try s.setCategory(.playAndRecord, mode: .default,
                              options: [.defaultToSpeaker, .allowBluetoothA2DP, .mixWithOthers])
            try s.setActive(true)
        } catch {
            try? s.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try? s.setActive(true)
        }
    }
}
