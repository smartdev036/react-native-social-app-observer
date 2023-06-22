import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/home';
import Podcasts from '../screens/home/podcasts';
import Radio from '../screens/home/radio';
import Opinion from '../screens/home/opinion';
import Featured from '../screens/home/featured';
import Latest from '../screens/home/latest';
import Popular from '../screens/home/popular';
import Article from '../screens/article';
import Search from '../screens/search';
import Author from '../screens/author';
import TopicsDetails from '../screens/topicsDetails';
import Authors from '../screens/authors';
import Columnists from '../screens/columnists';
import Columnist from '../screens/columnist';
import Topics from '../screens/topics';
import Premium from '../screens/premium';
import Alerts from '../screens/alerts';
import Saved from '../screens/saved';
import History from '../screens/history';
import About from '../screens/settings/about';
import Licenses from '../screens/settings/licenses';
import LicensesDetail from '../screens/settings/licensesDetail';
import Settings from '../screens/settings';
import Login from '../screens/auth/login';
import Register from '../screens/auth/register';
import ForgotPassword from '../screens/auth/forgotPassword';
import Comment from '../components/comments/comment';
import CommentReply from '../components/comments/commentReply';
import Episode from '../screens/home/podcasts/episode';
import ManageAlerts from '../screens/manageAlerts';
import Program from '../screens/home/podcasts/program';
import NotificationsSettings from '../screens/settings/notificationsSettings';
import Theme from '../screens/settings/theme';
import LetterSize from '../screens/settings/letterSize';
import Subscribe from '../screens/subscribe';
import { NativeStackNavigatorProps } from 'react-native-screens/lib/typescript/native-stack/types';
import DrawerContentMenu from '../components/menu/menu';
import { Feedback } from '../screens/feedback';

const Stack = createNativeStackNavigator<NativeStackNavigatorProps>();

const MainStackNavigator = () => {
  const navOptions = () => ({
    headerShown: false,
  });

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={navOptions} />
      <Stack.Screen name="Podcasts" component={Podcasts} options={navOptions} />
      <Stack.Screen name="Radio" component={Radio} options={navOptions} />
      <Stack.Screen name="Opinion" component={Opinion} options={navOptions} />
      <Stack.Screen name="Featured" component={Featured} options={navOptions} />
      <Stack.Screen name="Latest" component={Latest} options={navOptions} />
      <Stack.Screen name="Popular" component={Popular} options={navOptions} />
      <Stack.Screen name="Article" component={Article} options={navOptions} />
      <Stack.Screen name="Search" component={Search} options={navOptions} />
      <Stack.Screen name="Author" component={Author} options={navOptions} />
      <Stack.Screen name="TopicsDetails" component={TopicsDetails} options={navOptions} />
      <Stack.Screen name="Authors" component={Authors} options={navOptions} />
      <Stack.Screen name="Columnists" component={Columnists} options={navOptions} />
      <Stack.Screen name="Columnist" component={Columnist} options={navOptions} />
      <Stack.Screen name="Topics" component={Topics} options={navOptions} />
      <Stack.Screen name="Premium" component={Premium} options={navOptions} />
      <Stack.Screen name="Alerts" component={Alerts} options={navOptions} />
      <Stack.Screen name="Saved" component={Saved} options={navOptions} />
      <Stack.Screen name="History" component={History} options={navOptions} />
      <Stack.Screen name="About" component={About} options={navOptions} />
      <Stack.Screen name="Licenses" component={Licenses} options={navOptions} />
      <Stack.Screen name="LicensesDetail" component={LicensesDetail} options={navOptions} />
      <Stack.Screen name="Settings" component={Settings} options={navOptions} />
      <Stack.Screen name="Login" component={Login} options={navOptions} />
      <Stack.Screen name="Subscribe" component={Subscribe} options={navOptions} />
      <Stack.Screen name="Register" component={Register} options={navOptions} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={navOptions} />
      <Stack.Screen name="Comments" component={Comment} options={navOptions} />
      <Stack.Screen name="CommentReply" component={CommentReply} options={navOptions} />
      <Stack.Screen name="Episode" component={Episode} options={navOptions} />
      <Stack.Screen name="Program" component={Program} options={navOptions} />
      <Stack.Screen name="ManageAlerts" component={ManageAlerts} options={navOptions} />
      <Stack.Screen name="NotificationsSettings" component={NotificationsSettings} options={navOptions} />
      <Stack.Screen name="Theme" component={Theme} options={navOptions} />
      <Stack.Screen name="LetterSize" component={LetterSize} options={navOptions} />
      <Stack.Screen name="Mais" component={DrawerContentMenu} options={navOptions} />
      <Stack.Screen name="Feedback" component={Feedback} options={navOptions} />
    </Stack.Navigator>
  );
};

export { MainStackNavigator };
