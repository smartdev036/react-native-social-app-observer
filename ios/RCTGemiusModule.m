#import "RCTGemiusModule.h"
#import <GemiusSDK/GemiusSDK.h>

@implementation RCTGemiusModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    if (self = [super init]) {
        NSString *serverHost = @"https://gapt.hit.gemius.pl";
        NSString *scriptIdentifier = @"bDs1XZv5FaFvpe2MiPrCt3Z331kBW280Vo6VSxqS.Pj.47";
        [[GEMConfig sharedInstance] setAppInfo:@"Observador - NetAudience iOS" version:@"1.0"];
        [GEMAudienceConfig sharedInstance].hitcollectorHost = serverHost;
        [GEMAudienceConfig sharedInstance].scriptIdentifier = scriptIdentifier;
    }
    return self;
}

RCT_EXPORT_METHOD(sendEvent:(NSString *)data type:(NSString *)type) {
    BaseEventEventType eventType = BaseEventEventTypeFullPageview;
    if ([type isEqualToString:@"partial"]) {
        eventType = BaseEventEventTypePartialPageview;
    }
  NSString *scriptIdentifier = @"bDs1XZv5FaFvpe2MiPrCt3Z331kBW280Vo6VSxqS.Pj.47";
  GEMAudienceEvent *event = [[GEMAudienceEvent alloc] init];
  [event setScriptIdentifier:scriptIdentifier];
  [event setEventType:eventType];
  [event addExtraParameter:@"gA" value: data];
  [event sendEvent];
}

@end
