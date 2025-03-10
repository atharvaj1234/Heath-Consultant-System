import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Calendar, Lock, Receipt } from "lucide-react";
import { toast } from "react-toastify";
import { getConsultantById, createBooking } from "../utils/api";
import "react-toastify/dist/ReactToastify.css";

const PaymentPage = () => {
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [nameOnCard, setNameOnCard] = useState("");
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [consultant, setConsultant] = useState(null);
    const { id, pid } = useParams();
    const navigate = useNavigate();

    const platformCost = 5;
    const taxRate = 0.18;

    // Use optional chaining and default values to prevent errors
    const consultingFees = parseInt(consultant?.consultant?.consultingFees) || 0;
    const taxAmount = (consultingFees || 0) * taxRate;
    const totalAmount = (consultingFees || 0) + taxAmount + platformCost;

    useEffect(() => {
        const fetchConsultant = async () => {
            setProcessing(true);
            try {
                const data = await getConsultantById(id);
                setConsultant(data);
            } catch (err) {
                setConsultant(null);
                console.error("Failed to fetch consultant:", err);
                toast.error('Failed to retrieve consultant details. Please try again.', { position: "top-center", autoClose: 3000 });
            } finally {
                setProcessing(false);
            }
        };
        fetchConsultant();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
            toast.error("Please fill in all fields.", { position: "top-center", autoClose: 3000 });
            return;
        }

        if (cardNumber.length < 16) {
            toast.error("Invalid card number.", { position: "top-center", autoClose: 3000 });
            return;
        }
        if (expiryDate.length !== 5 || !expiryDate.includes("/")) {
            toast.error("Invalid expiry date.", { position: "top-center", autoClose: 3000 });
            return;
        }
        if (cvv.length < 3) {
            toast.error("Invalid CVV.", { position: "top-center", autoClose: 3000 });
            return;
        }

        setProcessing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

            console.log("Payment data:", { cardNumber, expiryDate, cvv, nameOnCard });

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error('Authentication required. Please login.', { position: "top-center", autoClose: 3000 });
                    return;
                }

                await createBooking(token, pid);
                setPaymentSuccess(true);
                toast.success("Payment successful!", { position: "top-center", autoClose: 3000 });

                setTimeout(() => {
                    navigate("/consultationdashboard");
                }, 2000);

            } catch (err) {
                console.error("Booking creation failed:", err);
                toast.error('Failed to create booking. Please try again.', { position: "top-center", autoClose: 3000 });
            }

        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.", { position: "top-center", autoClose: 3000 });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            {paymentSuccess ? (
                <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative bg-white shadow-lg sm:rounded-3xl p-8">
                        <h2 className="text-2xl font-semibold text-green-600 text-center mb-4">Payment Successful!</h2>
                        <p className="text-gray-700 text-center">Thank you for your payment.</p>
                    </div>
                </div>
            ) : (
                <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative bg-white shadow-lg sm:rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        <div className="md:order-1">
                            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Payment Information</h1>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="nameOnCard" className="block text-gray-700 text-sm font-bold mb-2">Name on Card</label>
                                    <input type="text" id="nameOnCard" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="John Doe" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="cardNumber" className="block text-gray-700 text-sm font-bold mb-2">Card Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input type="text" id="cardNumber" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10" placeholder="XXXX-XXXX-XXXX-XXXX" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div>
                                        <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">Expiry Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input type="text" id="expiryDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10" placeholder="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="cvv" className="block text-gray-700 text-sm font-bold mb-2">CVV</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input type="text" id="cvv" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10" placeholder="XXX" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                    >
                                        {processing ? "Processing..." : "Pay Now"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="md:order-2">
                            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Booking Summary</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-gray-700">
                                    <span className="font-semibold">Consulting Fees</span>
                                    <span>${consultingFees ? consultingFees.toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-700">
                                    <span className="font-semibold">Platform Fees</span>
                                    <span>${platformCost.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-700">
                                    <span className="font-semibold">Tax ({taxRate * 100}%)</span>
                                    <span>${taxAmount != null ? taxAmount.toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-900 text-xl font-bold mt-4">
                                    <span>Total</span>
                                    <span>${totalAmount != null ? totalAmount.toFixed(2) : '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;