// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real application, you would send this data to your backend
      // For demo purposes, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Contact Information */}
            <div className="md:w-1/3 bg-indigo-600 text-white p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="mb-8">
                Have questions about our products or services? We're here to
                help!
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-indigo-300" />
                  <div>
                    <h3 className="font-semibold">Our Location</h3>
                    <p className="text-indigo-100">
                      123 Commerce Street
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3 text-indigo-300" />
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="text-indigo-100">support@shopnext.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaPhone className="mt-1 mr-3 text-indigo-300" />
                  <div>
                    <h3 className="font-semibold">Call Us</h3>
                    <p className="text-indigo-100">(123) 456-7890</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <p className="text-indigo-100">
                  Monday - Friday: 9am - 5pm
                  <br />
                  Saturday: 10am - 4pm
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              {submitSuccess ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <p className="text-green-700">
                    Thank you for your message! We'll get back to you as soon as
                    possible.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "How long does shipping take?",
                answer:
                  "Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout for faster delivery.",
              },
              {
                question: "What is your return policy?",
                answer:
                  "We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. Please visit our Returns page for more details.",
              },
              {
                question: "Do you ship internationally?",
                answer:
                  "Yes, we ship to most countries worldwide. International shipping times vary by location, typically ranging from 7-14 business days.",
              },
              {
                question: "How can I track my order?",
                answer:
                  "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order by logging into your account.",
              },
              {
                question: "Are my payment details secure?",
                answer:
                  "Absolutely. We use industry-standard encryption and secure payment processors to ensure your personal and payment information is always protected.",
              },
            ].map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
