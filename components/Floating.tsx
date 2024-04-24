const Floating = () => {
  return (
    <a
      href="https://bento.me/anish7"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute top-2 right-2 md:right-8 z-40"
    >
      <button
        type="button"
        className="px-6 hover:px-8 py-2 rounded-full relative bg-neutral-700/50 text-white text-xs md:text-sm hover:shadow-lg hover:shadow-orange-600/[0.2] transition-all duration-200 border border-neutral-700"
      >
        <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <span className="relative z-20">Made By Anish</span>
      </button>
    </a>
  );
};

export default Floating;