/**
 * @param {Function} onRatioChange The callback when the scroll ratio changes
 */
 export const monitorScroll = onRatioChange => {
  const html = document.documentElement;
  const body = document.body;

  window.addEventListener('scroll', () => {
    onRatioChange(
      (html.scrollTop || body.scrollTop)
      /
      ((html.scrollHeight || body.scrollHeight) - html.clientHeight)
    );
  });
};