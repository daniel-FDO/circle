import { useRef, useState, type ChangeEvent } from "react";
import { CameraIcon, CheckIcon } from "./Icons";
import { fileToAvatar } from "../lib/image";
import { isValidHandle } from "../lib/profile";
import type { Profile } from "../types";

const BIO_LIMIT = 240;

const inputClass =
  "w-full rounded-lg bg-surface-low px-4 py-3 text-on-surface outline-none border border-transparent focus:border-primary/40 focus:bg-white transition";

const labelClass = "block text-sm font-semibold text-on-surface mb-2";

type ProfileFieldsProps = {
  profile: Profile;
  // Patches are merged by the parent so async avatar updates never overwrite newer edits
  onChange: (patch: Partial<Profile>) => void;
};

const ProfileFields = ({ profile, onChange }: ProfileFieldsProps) => {
  const { avatar, displayName, handle, bio, pronouns, location, website } = profile;
  const [avatarError, setAvatarError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const setAvatar = (value: string | null) => onChange({ avatar: value });
  const setDisplayName = (value: string) => onChange({ displayName: value });
  const setHandle = (value: string) => onChange({ handle: value });
  const setBio = (value: string) => onChange({ bio: value });
  const setPronouns = (value: string) => onChange({ pronouns: value });
  const setLocation = (value: string) => onChange({ location: value });
  const setWebsite = (value: string) => onChange({ website: value });

  const handleValid = isValidHandle(handle);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setAvatar(await fileToAvatar(file));
      setAvatarError(false);
    } catch {
      setAvatarError(true);
    }
  };

  return (
    <>
      <div className="mt-6 flex items-center gap-5 p-4 rounded-xl bg-surface-low">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-surface-high overflow-hidden flex items-center justify-center text-2xl font-serif text-muted">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0)
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white"
            aria-label="Upload portrait"
          >
            <CameraIcon />
          </button>
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold">Portrait & Stamp</h2>
          <p className="text-sm text-on-surface-variant">
            Recommended 400×400px. Tactile natural light preferred.
          </p>
          <div className="mt-2 flex items-center gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="text-primary hover:underline"
            >
              Change image
            </button>
            <span className="text-muted">•</span>
            <button
              type="button"
              onClick={() => setAvatar(null)}
              className="text-muted hover:text-on-surface"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="displayName">
            Display Name
          </label>
          <input
            id="displayName"
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <label className={labelClass} htmlFor="handle">
              Handle
            </label>
            {handleValid ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <CheckIcon className="w-3 h-3" /> Available
              </span>
            ) : (
              <span className="text-xs font-semibold text-red-600">
                3–20 chars, a–z 0–9 _
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              @
            </span>
            <input
              id="handle"
              className={`${inputClass} pl-9 font-mono text-sm`}
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-baseline">
          <label className={labelClass} htmlFor="bio">
            Short Bio
          </label>
          <span className="text-xs font-semibold text-muted">
            {bio.length} / {BIO_LIMIT}
          </span>
        </div>
        <textarea
          id="bio"
          rows={3}
          maxLength={BIO_LIMIT}
          className={`${inputClass} resize-none leading-relaxed`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: "pronouns", label: "Pronouns", value: pronouns, set: setPronouns },
          { id: "location", label: "Location", value: location, set: setLocation },
          { id: "website", label: "Personal URL", value: website, set: setWebsite },
        ].map((field) => (
          <div key={field.id}>
            <label className="block text-xs font-semibold mb-1.5" htmlFor={field.id}>
              {field.label}
            </label>
            <input
              id={field.id}
              className={`${inputClass} py-2 text-sm`}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
            />
          </div>
        ))}
      </div>

      {avatarError && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
          That image couldn't be read. Try a JPG or PNG.
        </p>
      )}
    </>
  );
};

export default ProfileFields;
