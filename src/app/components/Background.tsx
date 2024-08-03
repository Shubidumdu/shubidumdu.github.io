type BackgroundType = 'ocean' | 'cloud' | 'bunny' | 'pollock';

const IFRAME_BASE_URL = 'https://blog.shubidumdu.com/sketchbook/pages/';

type BackgroundProps = {
  type?: BackgroundType;
};

const Background = ({ type = 'ocean' }: BackgroundProps) => {
  return (
    <iframe
      id="background"
      title="background"
      className="w-full h-full fixed top-0 left-0 z-[-99]"
      src={`${IFRAME_BASE_URL}/${type}`}
    />
  );
};

export default Background;
