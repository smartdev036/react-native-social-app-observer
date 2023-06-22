import { Platform, Share, ShareContent } from 'react-native';
import { AlertError } from '../error/errorAlert';
import { OS } from '../constants';
import { LOG } from './logger';

export const shareLink = async (title: string, url: string) => {
  try {
    let content: ShareContent;
    if (Platform.OS === OS.android) {
      content = { title: title, message: url };
    } else {
      content = { title: title, url: url };
    }
    await Share.share(content);
  } catch (e: any) {
    AlertError('Erro', 'Não foi possível partilhar!', false);
    LOG.error('Error: shareLink');
  }
};
