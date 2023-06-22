export const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url && url.match(regExp);
  return match && match[2].length === 11 ? match[2] : undefined;
};
