import HandIcon from "@/assets/widgetHand.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useState } from "react";
import { ChevronLeft, ChevronsLeft, MessageCircle, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useWidget } from "@/context/WidgetContext";

const DataCollection = ({ initialData, activeComponent, onBack }) => {
  const [formData, setFormData] = useState(initialData);
  const { createContact, isLoading } = useWidget();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContact(formData);
      // Additional logic after successful contact creation can go here
    } catch (error) {
      console.error("Error creating contact:", error);
      // Handle error appropriately
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="pt-[20px] px-8 pb-[22px] h-full max-h-[140px] rounded-t-[18px] flex flex-col gap-4 leading-8 text-2xl font-semibold -tracking-[0.75px]">
        <span
          className="text-base text-slate-950 leading-6 font-medium gap-2 flex hover:cursor-pointer"
          onClick={onBack}
        >
          <ChevronLeft /> Back
        </span>
        <div className="flex flex-col">
          <p className="text-slate-950">
            {activeComponent === "call"
              ? "Talk to us now"
              : "Let’s chat real time"}
          </p>
          <p className="text-slate-400">Connect directly now</p>
        </div>
      </div>
      <div className="px-5 py-3 flex flex-col justify-between h-full bg-white rounded-b-[18px]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-5 font-sans">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Full name"
              value={formData.fullName}
              name="fullName"
              required
              onChange={handleChange}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-5 font-sans">
              Email address <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Email address"
              value={formData.email}
              name="email"
              onChange={handleChange}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-5 font-sans">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              value={formData.phone}
              onChange={(value, data) => {
                setFormData((prev) => ({
                  ...prev,
                  phone: value, // This will include the country code (e.g., +1234567890)
                  countryCode: data ? `+${data.dialCode}` : "+1", // Default to +1 if no country data
                }));
              }}
              required
              defaultCountry="US"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptTerms: checked })
              }
              className="mt-1 h-4 w-4"
              required
            />
            <label htmlFor="terms" className="flex flex-col">
              <p className="text-sm font-medium text-foreground">
                Accept terms and conditions
              </p>
              <p className="text-sm text-muted-foreground">
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-sans text-sm leading-6 font-medium"
            disabled={
              !formData.fullName ||
              !formData.email ||
              !formData.phone ||
              !formData.acceptTerms ||
              isLoading
            }
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {activeComponent === "call" ? (
                  <>
                    <Phone /> Start Call Now
                  </>
                ) : (
                  <>
                    <MessageCircle /> Start Chat Now
                  </>
                )}
              </>
            )}
          </Button>
        </form>
        <div className="text-neutral-500 font-inter text-sm leading-4 text-center">
          Powered by intervo
        </div>
      </div>
    </>
  );
};

export default DataCollection;
