import dynamic from "next/dynamic";
import { getUserIp } from "@/lib/user-utils";

const Floating = dynamic(() => import("@/components/Floating"));
const ThemeTogglebutton = dynamic(() => import("@/components/Themetoggle"));
const ChatContainer = dynamic(() => import("@/components/ChatContainer"));

export default async function Chat() {
  const userIp = await getUserIp();

  return (
    <>
      <ThemeTogglebutton />
      <Floating />
      <ChatContainer userIp={userIp} />
    </>
  );
}
