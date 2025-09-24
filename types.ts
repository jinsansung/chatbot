
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'loading';
}

export interface RegulationFile {
  id: string;
  name: string;
  content: string;
  link?: string;
}
