#import <React/RCTBridgeModule.h>
#import "RCTEventEmitter.h"

@interface RCTPianoModule : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, strong) NSMutableDictionary *eventParameters;
@property (nonatomic, strong) RCTResponseSenderBlock showLoginHandler;
@property (nonatomic, strong) RCTResponseSenderBlock showTemplateHandler;
@property (nonatomic, strong) UIViewController *presentTemplateController;

@end
