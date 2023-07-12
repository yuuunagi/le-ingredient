import {notification} from 'antd';

const defaultCallback = {
  success: () => {},
  fail: () => {},
  error: () => {},
  common: () => {},
};
export const parseBaseResponse = (promise, callback = defaultCallback) =>
  promise
    .then((baseResponse) => {
      const {success, msg} = baseResponse;
      if (success) {
        notification.success({message: '操作成功'});
        callback?.success?.(baseResponse);
        callback?.common?.();
      } else {
        notification.error({message: '操作失败', description: msg});
        callback?.fail?.(baseResponse);
        callback?.common?.();
      }
    })
    .catch((err) => {
      notification.error({
        message: '操作失败',
        description: JSON.stringify(err),
      });
      callback?.error?.(err);
      callback?.common?.();
    });
