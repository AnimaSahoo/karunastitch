import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character (!@#$%...)", met: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(password) },
  ];

  const strength = checks.filter((c) => c.met).length;
  const strengthLabel =
    strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength <= 3 ? "Good" : strength <= 4 ? "Strong" : "Very Strong";
  const strengthColorClass =
    strength <= 1
      ? "bg-destructive"
      : strength <= 2
        ? "bg-orange-500"
        : strength <= 3
          ? "bg-yellow-500"
          : strength <= 4
            ? "bg-primary"
            : "bg-emerald-500";

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= strength ? strengthColorClass : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-medium">{strengthLabel}</p>
      </div>

      {/* Requirements list */}
      <ul className="space-y-1">
        {checks.map((check, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-xs transition-colors ${
              check.met ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {check.met ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <X className="h-3 w-3 shrink-0" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;

export const isPasswordStrong = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(password)
  );
};
