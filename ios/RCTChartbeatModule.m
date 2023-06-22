#import "RCTChartbeatModule.h"
#import <Chartbeat/CBTracker.h>

@implementation RCTChartbeatModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setup:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject) {
  [[CBTracker sharedTracker] setupTrackerWithAccountId:55094 domain:@"observador.pt"];
  resolve(@(1));
}

RCT_EXPORT_METHOD(trackView:
                  (NSString *)viewId
                  title: (NSString *)viewTitle
                  callback: (RCTResponseSenderBlock) callback) {
  dispatch_async(dispatch_get_main_queue(), ^(void) {
    UIView *rootView = [UIApplication sharedApplication].keyWindow.rootViewController.view;
    @try {
      [[CBTracker sharedTracker] trackView:rootView viewId:viewId title:viewTitle];
      NSLog(@"CHARTBEAT, success");
      callback(@[@(true)]);
    } @catch (NSException * exception) {
      NSLog(@"CHARTBEAT: %@", exception);
      callback(@[@(false)]);
    }
  });
}

RCT_EXPORT_METHOD(trackCompleteView:
                  (NSString *)viewId
                  title: (NSString *)viewTitle
                  authors: (NSArray *)authors
                  categories: (NSArray *) categories
                  userType: (NSString *) userType
                  callback:(RCTResponseSenderBlock) callback) {
  dispatch_async(dispatch_get_main_queue(), ^(void) {
    UIView *rootView = [UIApplication sharedApplication].keyWindow.rootViewController.view;
    @try {
      [[CBTracker sharedTracker] trackView:rootView viewId:viewId title:viewTitle];
      [[CBTracker sharedTracker] setAuthors:(NSArray *) authors];
      [[CBTracker sharedTracker] setSections:(NSArray *) categories];
      if([userType isEqualToString: @"paid"]) {
        [[CBTracker sharedTracker] setUserPaid];
      } else if ([userType isEqualToString: @"lgdin"]) {
        [[CBTracker sharedTracker] setUserLoggedIn];
      } else {
        [[CBTracker sharedTracker] setUserAnonymous];
      };
      NSLog(@"CHARTBEAT, success");
      callback(@[@(true)]);
    } @catch (NSException * exception) {
      NSLog(@"CHARTBEAT: %@", exception);
      callback(@[@(false)]);
    }
  });
}

@end
