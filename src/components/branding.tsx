import Image from "next/image";

export function ProfilePhoto() {
  return <span className="profile-photo"><Image src="/rio-profile.png" alt="" width={24} height={24} /></span>;
}

export function ProfileAvatar() {
  return <span className="avatar" aria-label="Profile"><ProfilePhoto /><span className="avatar-status" /></span>;
}
