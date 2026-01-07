const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.ethereal.email' for testing
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

exports.sendIssueConfirmation = async (userEmail, issue) => {
    try {
        const info = await transporter.sendMail({
            from: '"CivicFix" <noreply@civicfix.com>',
            to: userEmail,
            subject: `Issue Reported: ${issue.title}`,
            text: `Thank you for reporting the issue: ${issue.title}. \n\nStatus: ${issue.status}\nPriority: ${issue.priorityScore}\n\nWe will notify you of updates.`,
            html: `
        <h3>Issue Reported Successfully</h3>
        <p>Thank you for reporting the issue: <strong>${issue.title}</strong>.</p>
        <p><strong>Status:</strong> ${issue.status}</p>
        <p><strong>Priority Score:</strong> ${issue.priorityScore}</p>
        <p>We will notify you of updates.</p>
      `
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.sendGovNotification = async (departmentEmail, issue) => {
    // Implementation for gov notification
    console.log(`Sending gov notification to ${departmentEmail} for issue ${issue._id}`);
};
