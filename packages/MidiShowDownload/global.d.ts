declare namespace JZZ {
  namespace gui {
    interface Player {
      loadUrl: () => JQuery.Promise<void>
    }
    interface PlayerConstructor {
      (el: HTMLElement, settings: object): Player
      new (el: HTMLElement, settings: object): Player
    }
    let Player: PlayerConstructor
  }

  namespace MIDI {
    interface SMF {}
    interface SMFConstructor {
      (data: string): SMF
      new (data: string): SMF
    }
    let SMF: SMFConstructor
  }
}

declare interface JQuery {
  JzzPlayer: () => JQuery
}
