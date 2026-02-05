using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreMoodFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StoreMoodFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewId = table.Column<Guid>(type: "uuid", nullable: true),
                    MoodCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EnergyScore = table.Column<short>(type: "smallint", nullable: false),
                    MusicScore = table.Column<short>(type: "smallint", nullable: false),
                    CrowdScore = table.Column<short>(type: "smallint", nullable: false),
                    ConversationScore = table.Column<short>(type: "smallint", nullable: false),
                    CreativityScore = table.Column<short>(type: "smallint", nullable: false),
                    ServiceScore = table.Column<short>(type: "smallint", nullable: false),
                    HighlightQuote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreMoodFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreMoodFeedbacks_Reviews_ReviewId",
                        column: x => x.ReviewId,
                        principalTable: "Reviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StoreMoodFeedbacks_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StoreMoodFeedbacks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StoreMoodFeedbacks_ReviewId",
                table: "StoreMoodFeedbacks",
                column: "ReviewId",
                unique: true,
                filter: "\"ReviewId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StoreMoodFeedbacks_StoreId",
                table: "StoreMoodFeedbacks",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_StoreMoodFeedbacks_StoreId_UserId",
                table: "StoreMoodFeedbacks",
                columns: new[] { "StoreId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoreMoodFeedbacks_UserId",
                table: "StoreMoodFeedbacks",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreMoodFeedbacks");
        }
    }
}
