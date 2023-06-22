//
//  ArticleService.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import Foundation

class ApiProvider {
  private let baseURL = "https://api.observador.pt/v5"
  
  let decoder = JSONDecoder()
  
  func getArticles(key: String, completion:@escaping ([Article]) -> ()) {
    let endpoint = "/lists/\(key)"
    guard let url = URL(string: baseURL + endpoint) else { return }
    
    let task = URLSession.shared.dataTask(with: url) { data, _, _ in
      do {
        self.decoder.dateDecodingStrategy = .iso8601
        let articles = try! self.decoder.decode([Article].self, from: data!)
        
        DispatchQueue.main.self.async {
          let newArticles = articles.prefix(10)
          completion(Array(newArticles))
        }
      } catch {
        print("Invalid data: \(error)")
      }
    }
    
    task.resume()
  }
  
  func getArticleDetail(id: Int, uri: String, completion:@escaping (Article) -> ()) {
    let endpoint = "/items/post/\(id)"
    guard let url = URL(string: baseURL + endpoint) else { return }
    
    let task = URLSession.shared.dataTask(with: url) { data, _, _ in
      do {
        self.decoder.dateDecodingStrategy = .iso8601
        let article = try! self.decoder.decode(Article.self, from: data!)
        
        DispatchQueue.main.self.async {
          completion(article)
        }
      } catch {
        print("Invalid data: \(error)")
      }
    }
    
    task.resume()
  }
}
