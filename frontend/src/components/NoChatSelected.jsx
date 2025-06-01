const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 ">
          <div className="relative">

            <img
              src="/chat%20logo.png"
              alt="Infinity Logo"
              className=" object-contain w-30 h-30 rounded-2xl  flex items-center justify-center animate-bounce"
              width={75}
              height={75}
            />
          </div>
        </div>

        {/* Welcome Text */}
<h2 className="text-2xl font-bold m-[15px]">Welcome to Infinity</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
