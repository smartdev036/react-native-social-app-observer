import WidgetKit
import SwiftUI
import Intents

struct WidgetData: Decodable {
  var title: String
  var pubdate: String
  var url: String
  var title1: String
  var pubdate1: String
  var url1: String
  var title2: String
  var pubdate2: String
  var url2: String
  var title3: String
  var pubdate3: String
  var url3: String
}

struct Provider: IntentTimelineProvider {

  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry(
      date: Date(),
      configuration: ConfigurationIntent(),
      title: "title",
      pubdate: "pubdate",
      url: "",
      title1: "title1",
      pubdate1: "pubdate1",
      url1: "",
      title2: "title2",
      pubdate2: "pubdate2",
      url2: "",
      title3: "title3",
      pubdate3: "pubdate3",
      url3: "")
  }

  func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
    let entry = SimpleEntry(
      date: Date(),
      configuration: configuration,
      title: "title" ,
      pubdate: "Data goes here",
      url: "",
      title1: "title1",
      pubdate1: "pubdate1",
      url1: "",
      title2: "title2",
      pubdate2: "pubdate2",
      url2: "",
      title3: "title2",
      pubdate3: "pubdate3",
      url3: "")
    completion(entry)
  }

  func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
    let userDefaults = UserDefaults.init(suiteName: "group.obsWidget")
    if userDefaults != nil {
      let entryDate = Date()
      if let savedData = userDefaults!.value(forKey: "widgetKey") as? String {
        let decoder = JSONDecoder()
        let data = savedData.data(using: .utf8)
        if let parsedData = try? decoder.decode(WidgetData.self, from: data!) {
          let nextRefresh = Calendar.current.date(byAdding: .second, value: 5, to: entryDate)!
          let entry = SimpleEntry(
            date: nextRefresh,
            configuration: configuration,
            title: parsedData.title,
            pubdate: parsedData.pubdate,
            url: parsedData.url,
            title1: parsedData.title1,
            pubdate1: parsedData.pubdate1,
            url1: parsedData.url1,
            title2: parsedData.title2,
            pubdate2: parsedData.pubdate2,
            url2: parsedData.url2,
            title3: parsedData.title3,
            pubdate3: parsedData.pubdate3,
            url3: parsedData.url3)
          let timeline = Timeline(entries: [entry], policy: .atEnd)
          completion(timeline)
        } else {
          print("Could not parse data")
        }
      } else {
        let nextRefresh = Calendar.current.date(byAdding: .second, value: 5, to: entryDate)!
        let entry = SimpleEntry(
          date: nextRefresh,
          configuration: configuration,
          title: "No data",
          pubdate: "No data set",
          url: "",
          title1: "title1",
          pubdate1: "pubdate1",
          url1: "",
          title2: "title2",
          pubdate2: "pubdate2",
          url2: "",
          title3: "title3",
          pubdate3: "pubdate3",
          url3: "")
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
      }
    }
  }
}

  struct SimpleEntry: TimelineEntry {
     let date: Date
      let configuration: ConfigurationIntent
      let title: String
      let pubdate: String
      let url: String
      let title1: String
      let pubdate1: String
      let url1: String
      let title2: String
      let pubdate2: String
      let url2: String
      let title3: String
      let pubdate3: String
      let url3: String
  }


struct MyWidgetExtensionEntryView : View {
  var entry: Provider.Entry
  
  @Environment(\.widgetFamily) var widgetFamily
  @Environment(\.colorScheme) var colorScheme
  
  private var deeplinkURL: URL {URL(string: "obsapp://observador.pt/\(entry.url)")!}
  private var deeplinkURL1: URL {URL(string: "obsapp://observador.pt/\(entry.url1)")!}
  private var deeplinkURL2: URL {URL(string: "obsapp://observador.pt/\(entry.url2)")!}
  private var deeplinkURL3: URL {URL(string: "obsapp://observador.pt/\(entry.url3)")!}
  
  var body: some View {
    ZStack {
      Color.clear
      VStack {
        VStack(alignment: .leading, spacing: 10){
          HStack(alignment: VerticalAlignment.top) {
            Image("appicon")
              .resizable()
              .frame(width: 18, height: 18)
            Text("Observador")
              .bold()
              .foregroundColor(colorScheme == .dark ? .white : .black)
              .textCase(.uppercase)
              .font(.system(size: 14))
          }
          
          Link(destination: deeplinkURL) {
            HStack(alignment: VerticalAlignment.top) {
              Text(entry.pubdate).foregroundColor(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0)).font(.system(size: 10)).frame(width: 50)
              VStack (alignment: HorizontalAlignment.leading) {
                Text(entry.title).foregroundColor(colorScheme == .dark ? .white : .black).padding(6).font(.system(size: 14));
              }
            }
          }
          
          Divider().background(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 10, trailing: 0))
         
          Link(destination: deeplinkURL1) {
            HStack(alignment: VerticalAlignment.top) {
              Text(entry.pubdate1).foregroundColor(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0)).font(.system(size: 10)).frame(width: 50)
              VStack (alignment: HorizontalAlignment.leading) {
                Text(entry.title1).foregroundColor(colorScheme == .dark ? .white : .black).padding(6).font(.system(size: 14));
              }
            }
          }
          
          Divider().background(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 10, trailing: 0))
          
          Link(destination: deeplinkURL2) {
            HStack(alignment: VerticalAlignment.top) {
              Text(entry.pubdate2).foregroundColor(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0)).font(.system(size: 10)).frame(width: 50)
              VStack (alignment: HorizontalAlignment.leading) {
                Text(entry.title2).foregroundColor(colorScheme == .dark ? .white : .black).padding(6).font(.system(size: 14));
              }
            }
          }
          
          Divider().background(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 10, trailing: 0))
         
          Link(destination: deeplinkURL3) {
            HStack(alignment: VerticalAlignment.top) {
              Text(entry.pubdate3).foregroundColor(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0)).font(.system(size: 10)).frame(width: 50)
              VStack (alignment: HorizontalAlignment.leading) {
                Text(entry.title3).foregroundColor(colorScheme == .dark ? .white : .black).padding(6).font(.system(size: 14));
              }
            }
          }
          
          Divider().background(.gray).padding(EdgeInsets(top: 10, leading: 0, bottom: 10, trailing: 0))
        }.frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity, alignment: .topLeading).padding(10)
        Spacer(minLength: 2)
        
        VStack(alignment: HorizontalAlignment.center) {
          Button(){
            print("tap")
          } label: {
            Text("Abrir app")
              .bold()
              .textCase(.uppercase)
              .foregroundColor(colorScheme == .dark ? .white : .black)
              .font(.system(size: 14))
          }
        }.padding(15)
        
      }
    }
  }
}
  
  @main
  struct MyWidgetExtension: Widget {
    let kind: String = "MyWidget"
    
    var body: some WidgetConfiguration {
      IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider()) { entry in
        MyWidgetExtensionEntryView(entry: entry)
      }
      .configurationDisplayName("My Widget")
      .description("Observador Widget!")
      .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
  }
  
struct MyWidgetExtension_Previews: PreviewProvider {
    static var previews: some View {
      MyWidgetExtensionEntryView(entry: SimpleEntry(
        date: Date(),
        configuration: ConfigurationIntent(),
        title: "title",
        pubdate: "pubdate",
        url: "",
        title1: "title1",
        pubdate1: "pubdate1",
        url1: "",
        title2: "title2",
        pubdate2: "pubdate2",
        url2: "",
        title3: "title3",
        pubdate3: "pubdate3",
        url3: ""))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
  }
