import { getChatResponse } from './utils/getChatResponse.js';

(async () => {
  try {
    const r = await getChatResponse('What is Bugema University?', ''); 
    console.log('response:', r);
  } catch (err) {
    console.error('test error:', err);
  }
})();