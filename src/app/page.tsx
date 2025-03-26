import {ModeToggle} from "@/components/ModeToggle";
import {Button} from "@/components/ui/button";
import {SignInButton, SignUpButton, SignedIn, SignedOut, UserButton} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className='m-4 flex gap-3'>
      <SignedOut>
        <SignInButton mode='modal'>
          <Button>Sign In</Button>
        </SignInButton>
        <SignUpButton mode='modal'>
          <Button variant='secondary'>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <ModeToggle />
    </div>
  );
}
