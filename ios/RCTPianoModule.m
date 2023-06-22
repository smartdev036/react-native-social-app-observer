#import "RCTPianoModule.h"
#import <React/RCTLog.h>
@import PianoComposer;
@import PianoTemplate;

@interface RCTPianoModule (PianoDelegate) <PianoComposerDelegate, PianoShowTemplateDelegate>
@end

@implementation RCTPianoModule

@synthesize eventParameters;
@synthesize showLoginHandler;
@synthesize showTemplateHandler;
@synthesize presentTemplateController;

BOOL _hasListeners;
static NSString *eventName = @"pianoEvent";
static const float popViewPreferredWidth = 600;
static const float popViewPreferredHeight = 730;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initComposer:(RCTPromiseResolveBlock)resolve
                               rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *AID = @"zK27EIf8Uk";
  PianoComposer *composer = [[PianoComposer alloc] initWithAid:AID endpoint:PianoEndpoint.production];
  [composer setDelegate:self];
  [composer execute];
  resolve(@(1));
}

RCT_EXPORT_METHOD(
                  seeList:(NSString *)AID
                  premium:(NSString *)_premium
                  contentCreated:(nullable NSString *)contentCreated
                  contentAuthor:(nullable NSString *)contentAuthor
                  contentSection:(nullable NSString *)contentSection
                  isPremium:(BOOL)isPremium
                  )
{
    RCTResponseSenderBlock showTemplateHandler;
    RCTResponseSenderBlock showLoginHandler;
    [self setEventParameters:[NSMutableDictionary new]];
    [self setShowLoginHandler:showLoginHandler];
    [self setShowTemplateHandler:showTemplateHandler];
  
    PianoComposer *composer = [[PianoComposer alloc] initWithAid:AID endpoint:PianoEndpoint.production];
    [composer setDelegate:self];
    
    NSSet *tags = [NSSet setWithObject:_premium];
    NSSet *t = [NSSet setWithObject:@"iap_subscription_active"];
  
    if(isPremium) {
      tags = [tags setByAddingObjectsFromSet:t];
    }
    [composer setTags:tags];
  
    NSString *zoneID = @"piano_exp_version_2";
    [composer setZoneId:zoneID];
  
    if (contentAuthor != nil) {
        [composer setContentAuthor:contentAuthor];
    }
       
    if (contentCreated != nil) {
        [composer setContentCreated:contentCreated];
    }
       
    if (contentSection != nil) {
        [composer setContentSection:contentSection];
    }
    
    [composer execute];
}

RCT_EXPORT_METHOD(closeTemplateControllerWithCompleteHandler:(RCTResponseSenderBlock)completeHandler) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.presentTemplateController dismissViewControllerAnimated:YES
                                                           completion:^{
            if(completeHandler) {
                completeHandler(@[]);
            }
        }];
    });
}

- (NSArray<NSString *> *)supportedEvents {
    return @[eventName];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

#pragma mark - piano delegate

-(void)showLoginWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(ShowLoginEventParams *)params {
    if (self.showLoginHandler != nil) {
        @try { // To avoid crash if experince shows login multiple times
            self.showLoginHandler(@[self.eventParameters]);
            [self setShowLoginHandler:nil]; // To avoid calling handler twice
        } @catch (NSException *exception) {}
    }
}

-(void)showTemplateWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(ShowTemplateEventParams *)params {
    
    [self.eventParameters setObject:@(params.showCloseButton) forKey:@"showCloseButton"];
    //PianoShowTemplatePopupViewController *showTemplate = [[PianoShowTemplatePopupViewController alloc] initWithParams:params];
    //if ( UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad )
    //{
    //    [showTemplate setPreferredContentSize:CGSizeMake(popViewPreferredWidth, popViewPreferredHeight)];
    //}
    //[self setPresentTemplateController:showTemplate];
    //[showTemplate setDelegate:self];
//    [showTemplate show];
    [self onCustomEventWithEventData:params];
//    RCTLog(@"Piano %@", [params templateUrl]);
    
    if (self.showTemplateHandler != nil) {
        @try {  // To avoid crash if experince shows login multiple times
            self.showTemplateHandler(@[self.eventParameters]);
            [self setShowTemplateHandler:nil]; // To avoid calling handler twice
        } @catch (NSException *exception) {}
    }
}

-(void)userSegmentTrueWithComposer:(PianoComposer *)composer event:(XpEvent *)event {
}

-(void)userSegmentFalseWithComposer:(PianoComposer *)composer event:(XpEvent *)event {
}

-(void)meterActiveWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(PageViewMeterEventParams *)params {
    
    [self.eventParameters setObject:params.meterName forKey:@"meterName"];
    [self.eventParameters setObject:@(params.views) forKey:@"views"];
    [self.eventParameters setObject:@(params.viewsLeft) forKey:@"viewsLeft"];
    [self.eventParameters setObject:@(params.maxViews) forKey:@"maxViews"];
    [self.eventParameters setObject:@(params.totalViews) forKey:@"totalViews"];
}

-(void)meterExpiredWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(PageViewMeterEventParams *)params {
    [self.eventParameters setObject:params.meterName forKey:@"meterName"];
    [self.eventParameters setObject:@(params.views) forKey:@"views"];
    [self.eventParameters setObject:@(params.viewsLeft) forKey:@"viewsLeft"];
    [self.eventParameters setObject:@(params.maxViews) forKey:@"maxViews"];
    [self.eventParameters setObject:@(params.totalViews) forKey:@"totalViews"];
}

-(void)experienceExecuteWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(ExperienceExecuteEventParams *)params {
}

-(void)experienceExecutionFailedWithComposer:(PianoComposer *)composer event:(XpEvent *)event params:(FailureEventParams *)params {
}

-(void)composerExecutionCompletedWithComposer:(PianoComposer *)composer {
}


#pragma mark - piano show template delegate

-(void)onRegisterWithEventData:(id)eventData {
    [self sendEventWithName:eventName body:@{
        @"eventName": @"templateCustomEvent",
        @"eventData": @{@"eventName": @"register"}
    }];
}

-(void)onLoginWithEventData:(id)eventData {
    [self sendEventWithName:eventName body:@{
        @"eventName": @"templateCustomEvent",
        @"eventData": @{@"eventName": @"login"}
    }];
}

-(void)onCustomEventWithEventData:(id)eventData {
    [self sendEventWithName:eventName body:@{
        @"type": @"showTemplate",
        @"container": [eventData containerSelector],
        @"url": [eventData templateUrl]
    }];
}
@end

