import {UserToken} from '../services/auth';
import {apiBarbeiro} from './endpoints';

// TODO any to type of comments
export const loadComments = async (
  postId: any,
  u: UserToken | null | undefined,
): Promise<any> => {
  return apiBarbeiro.get('comments?content_type=post&threaded=true', {
    params: {object_id: postId},
    headers:
      u != null ? {Authorization: `Bearer ${u.access_token}`} : undefined,
  });
};
