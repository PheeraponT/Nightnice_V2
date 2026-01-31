using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTitleToAdvertisement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Advertisements",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "Advertisements");
        }
    }
}
