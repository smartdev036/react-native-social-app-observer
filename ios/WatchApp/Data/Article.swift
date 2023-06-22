//
//  Article.swift
//  ObservadorWA Watch App
//
//  Created by Paulo Pinho on 27/12/2022.
//

import Foundation

class Links: Codable {
  var webUri: String
  var uri: String
  
  init() {
    webUri = "https://www.google.com"
    uri = "https://www.voz.vn"
  }
}

class Article: Codable, Identifiable {
  var id: Int
  var title: String?
  var fullTitle: String?
  var image: String?
  var pubDate: Date
  var links: Links
  var lead: String?
  
  func textDates() -> String {
    return pubDate.dateToString()
  }
  
  init() {
    id = 090998
    title = ""
    fullTitle = ""
    image = ""
    pubDate = Date()
    links = Links()
    lead = ""
  }
}

extension Date {
  func dateToString() -> String {
    let format = DateFormatter()
    format.locale = Locale(identifier: "pt_PT")
    format.dateFormat = "hh:mm"
    let time = format.string(from: self)
    let isToday = Calendar.current.isDateInToday(self)
    return (isToday ? "Hoje" : "Ontem") + ", \(time)"
  }
}
