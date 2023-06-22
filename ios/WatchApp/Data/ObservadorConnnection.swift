//
//  ObservadorConnnection.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import WatchKit
import WatchConnectivity

final class ObservadorConnection: NSObject, ObservableObject {
  @Published var receivedMessage = "Waiting..."
  
  var session: WCSession
  init(session: WCSession  = .default) {
    self.session = session
    super.init()
    if WCSession.isSupported() {
      session.delegate = self
      session.activate()
    }
  }
}

extension ObservadorConnection: WCSessionDelegate {
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
  
  func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
    print("watch received message", message);
    guard let messageFromApp = message["text"] as? String else { return }
    DispatchQueue.main.async {
      self.receivedMessage = messageFromApp
    }
  }
}
