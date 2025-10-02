import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_ORGANIZATION, OPENAI_PROJECT } from './config';

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION,
  project: OPENAI_PROJECT,
});
export default client;
