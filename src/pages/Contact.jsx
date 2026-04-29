import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigateTo = useNavigate();

  const handleContactForm = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (phone.length < 10 || phone.length > 15) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    setLoading(true);

    const templateParams = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      toast.success("Thank You! Your message has been sent successfully.");
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      
      // Navigate after delay
      setTimeout(() => {
        navigateTo("/");
      }, 2000);
      
    } catch (err) {
      console.error("EmailJS Error:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full ml-0 m-0 h-fit px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen py-4 justify-start">
      <div className="bg-white mx-auto w-full max-w-2xl h-auto px-4 sm:px-6 flex flex-col gap-4 items-center py-6 sm:py-8 justify-center rounded-lg shadow-md">
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={handleContactForm}
        >
          <h3 className="text-[#D6482B] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl text-center">
            Contact Us
          </h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] text-stone-600 font-medium">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] text-stone-600 font-medium">Your Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] text-stone-600 font-medium">Your Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              required
              maxLength="15"
              placeholder="10-15 digits"
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] text-stone-600 font-medium">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] text-stone-600 font-medium">Message *</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent resize-none"
              required
              disabled={loading}
            />
          </div>

          <button
            className="bg-[#d6482b] w-full sm:w-auto mx-auto font-semibold hover:bg-[#b8381e] text-xl transition-all duration-300 py-3 px-6 rounded-md text-white my-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-2">
            * Required fields
          </p>
        </form>
      </div>
    </section>
  );
};

export default Contact;