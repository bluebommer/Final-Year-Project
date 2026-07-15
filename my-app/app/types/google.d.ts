// types/google.d.ts
interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: { credential: string }) => void;
  // FedCM is the modern, non-third-party-cookie-dependent path Chrome is
  // migrating One Tap/Sign In With Google to — without it, the prompt can
  // silently no-op in browsers that have already dropped legacy 3P cookies.
  use_fedcm_for_prompt?: boolean;
  itp_support?: boolean;
}

interface GoogleButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  logo_alignment?: "left" | "center";
  width?: number;
}

interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: GoogleIdConfiguration) => void;
        prompt: () => void;
        renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
      };
    };
  };
}
