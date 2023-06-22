#import <React/RCTBridgeModule.h>

@interface RCTGemiusModule : NSObject <RCTBridgeModule>

typedef NS_ENUM(NSUInteger, BaseEventEventType) {
    BaseEventEventTypeFullPageview,
    BaseEventEventTypePartialPageview
};
 
@property (nonatomic, strong) NSString *scriptIdentifier;
@property (nonatomic, assign) BaseEventEventType eventType;


@end
