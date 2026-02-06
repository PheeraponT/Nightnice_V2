using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAccountManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowMoodDigest",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "MarketingUpdates",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShareLocation",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "UserFavoriteStores",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavoriteStores", x => new { x.UserId, x.StoreId });
                    table.ForeignKey(
                        name: "FK_UserFavoriteStores_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserFavoriteStores_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteStores_CreatedAt",
                table: "UserFavoriteStores",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteStores_StoreId",
                table: "UserFavoriteStores",
                column: "StoreId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFavoriteStores");

            migrationBuilder.DropColumn(
                name: "AllowMoodDigest",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MarketingUpdates",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ShareLocation",
                table: "Users");
        }
    }
}
