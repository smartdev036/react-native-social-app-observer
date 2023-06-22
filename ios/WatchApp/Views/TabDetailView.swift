//
//  TabDetailView.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import SwiftUI

struct ArticleRow: View {
  @State private var showModal: Bool = false
  
  var article: Article
  var body: some View {
    VStack(alignment: .leading) {
      Button(action: {
        self.showModal = true
      }) {
        Text(article.title ?? "").font(.headline)
      }
      .sheet(isPresented: self.$showModal) {
        ArticleView(article: article)
      }
      Text(article.textDates()).font(.system(size: 12)).foregroundColor(.blue)
    }
  }
}

struct TabDetailView: View {
  var title: String
  var key: String
  
  @State var articles: [Article] = []
  @State var didAppear = false
  
  var body: some View {
    NavigationView{
      List(self.articles) { article in
        ArticleRow(article: article)
      }.navigationBarTitle(title)
    }.onAppear (perform: onLoad)
  }
  
  private func onLoad() {
    if !didAppear {
      ApiProvider().getArticles(key: key) { (articles) in
        self.articles = articles
      }
    }
    didAppear = true
  }
}

struct TabDetailView_Previews: PreviewProvider {
  static var previews: some View {
    let title = ""
    let key = ""
    
    TabDetailView(title: title, key: key)
  }
}

