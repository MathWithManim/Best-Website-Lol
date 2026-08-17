import RNGGame from './RNGGame';

const RNGSection = () => {
  return (
    <section className="p-10 border-t border-primary/20">
      <RNGGame onRollComplete={() => {}} />
    </section>
  );
};

export default RNGSection;
