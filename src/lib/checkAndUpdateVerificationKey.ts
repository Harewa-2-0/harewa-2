import TicketKey from "@/lib/models/TicketKey";

export const checkAndUpdateVerificationKey = async (
    verificationKey: string,
    tId: string
) => {
    try {
        if (!verificationKey) {
            return { success: false, message: "Verification key is required." };
        }
        const query: { verificationKey: string; ticketId?: string } = {
            verificationKey,
        };

        if (tId && tId !== "all") {
            query.ticketId = tId;
        }

        const ticket = await TicketKey.findOne(query);

        if (!ticket) {
            return { success: false, message: "Invalid verification key." };
        }

        if (ticket.isExpired) {
            return { success: false, message: "Ticket has expired." };
        }

        if (ticket.isGroup) {
            if (ticket.isUsed >= ticket.groupLimit) {
                return { success: false, message: "Group limit exceeded." };
            }

            // Update isUsed, but do not mark as fully checked in unless limit is reached
            ticket.isUsed += 1;

            if (ticket.isUsed >= ticket.groupLimit) {
                ticket.isCheckedIn = true;
                ticket.checkInTime = new Date();
            }
        } else {
            if (ticket.isCheckedIn) {
                return { success: false, message: "Ticket already checked in." };
            }

            ticket.isUsed = 1;
            ticket.isCheckedIn = true;
            ticket.checkInTime = new Date();
        }

        await ticket.save();

        return { success: true, message: "Check-in successful." };
    } catch (error) {
        console.error("Check-in Error:", error);
        return { success: false, message: "Server error during check-in." };
    }
};