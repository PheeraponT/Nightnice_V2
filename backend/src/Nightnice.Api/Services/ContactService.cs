using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Data;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

// T089: Contact service for handling inquiries
public class ContactService
{
    private readonly NightniceDbContext _context;
    private readonly ILogger<ContactService> _logger;

    public ContactService(NightniceDbContext context, ILogger<ContactService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ContactInquiryResponse> SubmitInquiryAsync(ContactInquiryDto inquiry)
    {
        try
        {
            var contactInquiry = new ContactInquiry
            {
                Id = Guid.NewGuid(),
                Name = inquiry.Name,
                Email = inquiry.Email,
                Phone = inquiry.Phone,
                InquiryType = inquiry.InquiryType,
                Message = inquiry.Message,
                StoreName = inquiry.StoreName,
                PackageInterest = inquiry.PackageInterest,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactInquiries.Add(contactInquiry);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Contact inquiry received: RefId={ReferenceId}, Name={Name}, Email={Email}, Type={Type}",
                contactInquiry.Id, inquiry.Name, inquiry.Email, inquiry.InquiryType);

            return new ContactInquiryResponse(
                Success: true,
                Message: "ส่งข้อความสำเร็จ ทีมงานจะติดต่อกลับโดยเร็วที่สุด",
                ReferenceId: contactInquiry.Id
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing contact inquiry for {Email}", inquiry.Email);

            return new ContactInquiryResponse(
                Success: false,
                Message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
                ReferenceId: null
            );
        }
    }

    // T143: Admin contact methods
    public async Task<IEnumerable<AdminContactDto>> GetAllContactsAsync()
    {
        return await _context.ContactInquiries
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AdminContactDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.InquiryType,
                c.Message,
                c.StoreName,
                c.PackageInterest,
                c.IsRead,
                c.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<AdminContactDto?> GetContactByIdAsync(Guid id)
    {
        return await _context.ContactInquiries
            .Where(c => c.Id == id)
            .Select(c => new AdminContactDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.InquiryType,
                c.Message,
                c.StoreName,
                c.PackageInterest,
                c.IsRead,
                c.CreatedAt
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<bool> MarkAsReadAsync(Guid id)
    {
        var contact = await _context.ContactInquiries.FindAsync(id);
        if (contact == null)
            return false;

        contact.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteContactAsync(Guid id)
    {
        var contact = await _context.ContactInquiries.FindAsync(id);
        if (contact == null)
            return false;

        _context.ContactInquiries.Remove(contact);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUnreadCountAsync()
    {
        return await _context.ContactInquiries.CountAsync(c => !c.IsRead);
    }
}
