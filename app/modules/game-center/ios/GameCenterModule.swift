import ExpoModulesCore
import GameKit
import UIKit

/// Lukker Game Center-vinduet når brukeren trykker «Ferdig».
final class GameCenterDismissDelegate: NSObject, GKGameCenterControllerDelegate {
  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }
}

public class GameCenterModule: Module {
  private let dismissDelegate = GameCenterDismissDelegate()

  public func definition() -> ModuleDefinition {
    Name("GameCenter")

    /// Er spilleren logget inn i Game Center?
    Function("isAuthenticated") { () -> Bool in
      return GKLocalPlayer.local.isAuthenticated
    }

    /// Spillerens Game Center-navn, eller nil.
    Function("displayName") { () -> String? in
      let player = GKLocalPlayer.local
      return player.isAuthenticated ? player.displayName : nil
    }

    /// Logger inn. Viser Apples innloggingsvindu hvis det trengs.
    /// Svarer true når spilleren er logget inn, ellers false.
    AsyncFunction("authenticate") { (promise: Promise) in
      let player = GKLocalPlayer.local
      if player.isAuthenticated {
        promise.resolve(true)
        return
      }
      var settled = false
      player.authenticateHandler = { viewController, _ in
        if let viewController = viewController {
          GameCenterModule.topViewController()?.present(viewController, animated: true)
          return
        }
        if !settled {
          settled = true
          promise.resolve(player.isAuthenticated)
        }
      }
    }.runOnQueue(.main)

    /// Sender ett resultat til en eller flere topplister.
    AsyncFunction("submitScore") { (score: Int, leaderboardIDs: [String], promise: Promise) in
      let player = GKLocalPlayer.local
      guard player.isAuthenticated else {
        promise.reject("E_NOT_AUTHENTICATED", "Game Center player is not authenticated")
        return
      }
      GKLeaderboard.submitScore(score, context: 0, player: player, leaderboardIDs: leaderboardIDs) { error in
        if let error = error {
          promise.reject("E_SUBMIT_FAILED", error.localizedDescription)
        } else {
          promise.resolve(true)
        }
      }
    }

    /// Viser Game Center-topplistene. Med ID vises den ene listen, ellers oversikten.
    AsyncFunction("showLeaderboards") { (leaderboardID: String?, promise: Promise) in
      let controller: GKGameCenterViewController
      if let id = leaderboardID, !id.isEmpty {
        controller = GKGameCenterViewController(leaderboardID: id, playerScope: .global, timeScope: .allTime)
      } else {
        controller = GKGameCenterViewController(state: .leaderboards)
      }
      controller.gameCenterDelegate = self.dismissDelegate
      guard let top = GameCenterModule.topViewController() else {
        promise.reject("E_NO_VIEW_CONTROLLER", "No view controller to present from")
        return
      }
      top.present(controller, animated: true) {
        promise.resolve(true)
      }
    }.runOnQueue(.main)
  }

  /// Øverste synlige skjerm, så Game Center-vinduer kan vises oppå appen.
  static func topViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let windows = scenes.flatMap { $0.windows }
    let window = windows.first { $0.isKeyWindow } ?? windows.first
    var top = window?.rootViewController
    while let presented = top?.presentedViewController {
      top = presented
    }
    return top
  }
}
