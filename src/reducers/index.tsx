import { combineReducers } from "redux";
import authReducer from "./auth";
import subscriptionReducer from "./subscription";

const rootReducer = combineReducers({
  authReducer,
  subscriptionReducer,
});

export default rootReducer;
