//
//  ContentView.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import SwiftUI

struct Main: View {
  @State var selection = 0
  @ObservedObject var connection = ObservadorConnection()
  
  var body: some View {
    TabView(selection: $selection) {
      TabDetailView(title: "Últimas", key: "latest").tag(0)
      TabDetailView(title: "Destaques", key: "featured").tag(1)
      TabDetailView(title: "Mais Populares", key: "popular").tag(2)
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    Main()
  }
}
