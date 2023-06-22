//
//  ArticleView.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import SwiftUI

struct EmptyView: View {
  var body: some View {
    Text("")
  }
}

struct ImageView: View {
  @State var imgUrl: String
  
  var body: some View {
    AsyncImage(url: URL(string: imgUrl))
      .onAppear(perform: prepare)
  }
  
  private func prepare() {
    let screenWidth = Int(WKInterfaceDevice.current().screenBounds.width)
    
    imgUrl = imgUrl.replacingOccurrences(of: "{{width}}", with: "\(screenWidth)")
      .replacingOccurrences(of: "{{quality}}", with: "90")
    print(imgUrl)
  }
}

struct ArticleView: View {
  @Environment(\.dismiss) var dismiss
  
  var article: Article
  
  @State var didAppear = false
  @State private var articleDetail: Article?
  
  var body: some View {
    VStack(alignment: .leading) {
      if let articleDetail = articleDetail {
        ScrollView {
          VStack(alignment: .leading) {
            ImageView(imgUrl: articleDetail.image!)
            Text(articleDetail.fullTitle!).font(.system(size: 18)).bold()
            Text(article.textDates()).font(.system(size: 12)).foregroundColor(.blue).padding(.vertical, 4)
            Text(articleDetail.lead!).font(.system(size: 14)).bold()
          }
        }
      } else {
        EmptyView()
      }
    }.onAppear(perform: onLoad)
      .toolbar(content: {
        ToolbarItem(placement: .cancellationAction) {
          Button("Fechar") {
            self.dismiss()
          }
        }
      })
  }
  
  private func onLoad() {
    if !didAppear {
      ApiProvider().getArticleDetail(id: article.id, uri: article.links.uri) { (data) in
        self.articleDetail = data
      }
    }
    didAppear = true
  }
}

struct ArticleView_Previews: PreviewProvider {
  static var previews: some View {
    ArticleView(article: Article())
  }
}
