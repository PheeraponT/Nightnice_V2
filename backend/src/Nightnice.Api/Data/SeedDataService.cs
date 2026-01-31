using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data;

public class SeedDataService
{
    private readonly NightniceDbContext _context;

    public SeedDataService(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        await SeedRegionsAndProvincesAsync();
        await SeedCategoriesAsync();
        await SeedAdminUserAsync();
        await _context.SaveChangesAsync();
    }

    private async Task SeedRegionsAndProvincesAsync()
    {
        if (await _context.Regions.AnyAsync())
            return;

        var regions = new Dictionary<string, (string Name, string Slug, int SortOrder, List<string> Provinces)>
        {
            ["central"] = ("ภาคกลาง", "central", 1, new List<string>
            {
                "กรุงเทพมหานคร", "กำแพงเพชร", "ชัยนาท", "นครนายก", "นครปฐม", "นครสวรรค์",
                "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์",
                "ลพบุรี", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระบุรี", "สิงห์บุรี",
                "สุโขทัย", "สุพรรณบุรี", "อ่างทอง", "อุทัยธานี"
            }),
            ["northern"] = ("ภาคเหนือ", "northern", 2, new List<string>
            {
                "เชียงราย", "เชียงใหม่", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน", "อุตรดิตถ์"
            }),
            ["northeastern"] = ("ภาคตะวันออกเฉียงเหนือ", "northeastern", 3, new List<string>
            {
                "กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์",
                "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "สกลนคร", "สุรินทร์",
                "ศรีสะเกษ", "หนองคาย", "หนองบัวลำภู", "อุดรธานี", "อุบลราชธานี", "อำนาจเจริญ"
            }),
            ["eastern"] = ("ภาคตะวันออก", "eastern", 4, new List<string>
            {
                "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ตราด", "ปราจีนบุรี", "ระยอง", "สระแก้ว"
            }),
            ["western"] = ("ภาคตะวันตก", "western", 5, new List<string>
            {
                "กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"
            }),
            ["southern"] = ("ภาคใต้", "southern", 6, new List<string>
            {
                "กระบี่", "ชุมพร", "ตรัง", "นครศรีธรรมราช", "นราธิวาส", "ปัตตานี", "พังงา",
                "พัทลุง", "ภูเก็ต", "ยะลา", "ระนอง", "สงขลา", "สตูล", "สุราษฎร์ธานี"
            })
        };

        var sortOrder = 1;
        foreach (var (key, regionData) in regions)
        {
            var region = new Region
            {
                Id = Guid.NewGuid(),
                Name = regionData.Name,
                Slug = regionData.Slug,
                SortOrder = regionData.SortOrder
            };

            _context.Regions.Add(region);

            foreach (var provinceName in regionData.Provinces)
            {
                var province = new Province
                {
                    Id = Guid.NewGuid(),
                    RegionId = region.Id,
                    Name = provinceName,
                    Slug = GenerateSlug(provinceName),
                    SortOrder = sortOrder++
                };
                _context.Provinces.Add(province);
            }
        }
    }

    private async Task SeedCategoriesAsync()
    {
        if (await _context.Categories.AnyAsync())
            return;

        var categories = new[]
        {
            ("ร้านเหล้า", "liquor-store", 1),
            ("บาร์", "bar", 2),
            ("ผับ", "pub", 3),
            ("ร้านอาหารกลางคืน", "late-night-restaurant", 4)
        };

        foreach (var (name, slug, sortOrder) in categories)
        {
            _context.Categories.Add(new Category
            {
                Id = Guid.NewGuid(),
                Name = name,
                Slug = slug,
                SortOrder = sortOrder
            });
        }
    }

    private async Task SeedAdminUserAsync()
    {
        if (await _context.AdminUsers.AnyAsync())
            return;

        // Default admin: admin / Admin@123
        _context.AdminUsers.Add(new AdminUser
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Email = "admin@nightnice.com"
        });
    }

    private static string GenerateSlug(string name)
    {
        // Thai to English transliteration mapping (simplified)
        var mapping = new Dictionary<string, string>
        {
            ["กรุงเทพมหานคร"] = "bangkok",
            ["กำแพงเพชร"] = "kamphaeng-phet",
            ["ชัยนาท"] = "chai-nat",
            ["นครนายก"] = "nakhon-nayok",
            ["นครปฐม"] = "nakhon-pathom",
            ["นครสวรรค์"] = "nakhon-sawan",
            ["นนทบุรี"] = "nonthaburi",
            ["ปทุมธานี"] = "pathum-thani",
            ["พระนครศรีอยุธยา"] = "ayutthaya",
            ["พิจิตร"] = "phichit",
            ["พิษณุโลก"] = "phitsanulok",
            ["เพชรบูรณ์"] = "phetchabun",
            ["ลพบุรี"] = "lopburi",
            ["สมุทรปราการ"] = "samut-prakan",
            ["สมุทรสงคราม"] = "samut-songkhram",
            ["สมุทรสาคร"] = "samut-sakhon",
            ["สระบุรี"] = "saraburi",
            ["สิงห์บุรี"] = "sing-buri",
            ["สุโขทัย"] = "sukhothai",
            ["สุพรรณบุรี"] = "suphan-buri",
            ["อ่างทอง"] = "ang-thong",
            ["อุทัยธานี"] = "uthai-thani",
            ["เชียงราย"] = "chiang-rai",
            ["เชียงใหม่"] = "chiang-mai",
            ["น่าน"] = "nan",
            ["พะเยา"] = "phayao",
            ["แพร่"] = "phrae",
            ["แม่ฮ่องสอน"] = "mae-hong-son",
            ["ลำปาง"] = "lampang",
            ["ลำพูน"] = "lamphun",
            ["อุตรดิตถ์"] = "uttaradit",
            ["กาฬสินธุ์"] = "kalasin",
            ["ขอนแก่น"] = "khon-kaen",
            ["ชัยภูมิ"] = "chaiyaphum",
            ["นครพนม"] = "nakhon-phanom",
            ["นครราชสีมา"] = "nakhon-ratchasima",
            ["บึงกาฬ"] = "bueng-kan",
            ["บุรีรัมย์"] = "buriram",
            ["มหาสารคาม"] = "maha-sarakham",
            ["มุกดาหาร"] = "mukdahan",
            ["ยโสธร"] = "yasothon",
            ["ร้อยเอ็ด"] = "roi-et",
            ["เลย"] = "loei",
            ["สกลนคร"] = "sakon-nakhon",
            ["สุรินทร์"] = "surin",
            ["ศรีสะเกษ"] = "sisaket",
            ["หนองคาย"] = "nong-khai",
            ["หนองบัวลำภู"] = "nong-bua-lamphu",
            ["อุดรธานี"] = "udon-thani",
            ["อุบลราชธานี"] = "ubon-ratchathani",
            ["อำนาจเจริญ"] = "amnat-charoen",
            ["จันทบุรี"] = "chanthaburi",
            ["ฉะเชิงเทรา"] = "chachoengsao",
            ["ชลบุรี"] = "chonburi",
            ["ตราด"] = "trat",
            ["ปราจีนบุรี"] = "prachin-buri",
            ["ระยอง"] = "rayong",
            ["สระแก้ว"] = "sa-kaeo",
            ["กาญจนบุรี"] = "kanchanaburi",
            ["ตาก"] = "tak",
            ["ประจวบคีรีขันธ์"] = "prachuap-khiri-khan",
            ["เพชรบุรี"] = "phetchaburi",
            ["ราชบุรี"] = "ratchaburi",
            ["กระบี่"] = "krabi",
            ["ชุมพร"] = "chumphon",
            ["ตรัง"] = "trang",
            ["นครศรีธรรมราช"] = "nakhon-si-thammarat",
            ["นราธิวาส"] = "narathiwat",
            ["ปัตตานี"] = "pattani",
            ["พังงา"] = "phang-nga",
            ["พัทลุง"] = "phatthalung",
            ["ภูเก็ต"] = "phuket",
            ["ยะลา"] = "yala",
            ["ระนอง"] = "ranong",
            ["สงขลา"] = "songkhla",
            ["สตูล"] = "satun",
            ["สุราษฎร์ธานี"] = "surat-thani"
        };

        return mapping.TryGetValue(name, out var slug)
            ? slug
            : name.ToLowerInvariant().Replace(" ", "-");
    }
}
