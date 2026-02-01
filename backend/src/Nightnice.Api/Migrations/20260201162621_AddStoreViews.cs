using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StoreViews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    Referrer = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SessionHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreViews_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StoreViews_CreatedAt",
                table: "StoreViews",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_StoreViews_StoreId",
                table: "StoreViews",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_StoreViews_StoreId_CreatedAt",
                table: "StoreViews",
                columns: new[] { "StoreId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreViews");
        }
    }
}
