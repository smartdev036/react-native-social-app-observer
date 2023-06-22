import { store } from "../store";

// EventKind enum
export type EventKind = typeof EVENT_KIND_VIEW | typeof EVENT_KIND_INTERACTION;
export const EVENT_KIND_VIEW = 1;
export const EVENT_KIND_INTERACTION = 2;

// EventSource enum
export type EventSource = typeof EVENT_SOURCE_APP;
export const EVENT_SOURCE_APP = 2;
//export const EVENT_SOURCE_WEB = 1;
//export const EVENT_SOURCE_AMP = 3;

// UserKind enum, doesn't need to be exported, we send it ourselves.
type UserKind = typeof USER_KIND_ANNON | typeof USER_KIND_LOGGEDIN | typeof USER_KIND_PAID;
const USER_KIND_ANNON = 1;
const USER_KIND_LOGGEDIN = 2;
const USER_KIND_PAID = 3;

// Value types. These describe the properties of an event, we need short keys for I/O
// and for a smaller inline payload.
export type Timestamp = number;
export enum ContentType {
  POST = "post",
  PAGE = "page",
}
export type ContentID = string;
export type BrowserID = string;
export type UserID = string;
export type ContentPaywalled = boolean;
export type ContentUnlocked = boolean;
export type SawIntro = boolean;
export type Dimension1 = string;
export type Dimension2 = string;
export type Dimension3 = string;
export type Dimension4 = string;
export type Dimension5 = string;
export type Metric1 = string;
export type Metric2 = string;
export type Metric3 = string;
export type Metric4 = string;
export type Metric5 = string;

// What an event looks like.
// We need short keys for I/O and for a smaller inline payload so we use the types
// to still convey meaning.
export type QualityReadsEvent = {
  t?: Timestamp;
  e?: EventKind;
  s?: EventSource;
  b?: BrowserID; // sent automatically by us
  uk?: UserKind; // sent automatically by us
  ui?: UserID; // sent automatically by us
  ct: ContentType;
  ci: ContentID;
  cp?: ContentPaywalled;
  cu?: ContentUnlocked;
  si?: SawIntro;
} & Dims;
export type Dims = {
  d1?: Dimension1;
  d2?: Dimension2;
  d3?: Dimension3;
  d4?: Dimension4;
  d5?: Dimension5;
  m1?: Metric1;
  m2?: Metric2;
  m3?: Metric3;
  m4?: Metric4;
  m5?: Metric5;
};

export type MaxScrollT = {maxScrolled: number, maxTimeStamp: number, scrollHeith: number}
export const qualityReadsURL = 'https://qualityreads-record-abkacwmgba-ew.a.run.app/record';

export function getUserKind() {
  let userKind: UserKind = USER_KIND_ANNON;
  const {auth, piano} = store.getState();
  if (piano.isPremium) {
    userKind = USER_KIND_PAID;
  } else if (auth.user?.user) {
    userKind = USER_KIND_LOGGEDIN;
  }
  return userKind;
}

export function btos(v): string {
  if (v === true) return 'true';
  if (v === false) return 'false';
  return 'undefined';
}
