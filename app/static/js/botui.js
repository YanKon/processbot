var botui = new BotUI('my-botui-app');      
botui.message.bot({
  content: 'Hello There!',
  delay: 1,
  loading: true
});
botui.message.bot({
  content: 'How can I help you?',
  delay: 1000,
  loading: true
});

