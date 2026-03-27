import { FaFacebookF, FaGoogle } from "react-icons/fa";

export default function SocialLogin() {
  return (
    <div className="mt-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#bdbdbd]" />
        <span className="text-xs text-[#767676]">Or login with</span>
        <div className="h-px flex-1 bg-[#bdbdbd]" />
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8d8d8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          aria-label="Login with Google"
        >
          <FaGoogle className="text-[20px] text-[#db4437]" />
        </button>

        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8d8d8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          aria-label="Login with Facebook"
        >
          <FaFacebookF className="text-[20px] text-[#1877f2]" />
        </button>
      </div>
    </div>
  );
}