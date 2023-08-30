const IFRAME_SRC = 'https://shubidumdu.github.io/sketchbook/pages/ocean/';

const Background = () => {
  return (
    <iframe
      id="background"
      title="background"
      className="w-full h-full fixed top-0 left-0 z-[-99]"
      src={IFRAME_SRC}
    />
  );
};

export default Background;
