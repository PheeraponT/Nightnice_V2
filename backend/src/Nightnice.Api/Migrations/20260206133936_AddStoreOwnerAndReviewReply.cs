using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreOwnerAndReviewReply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Stores",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerReply",
                table: "Reviews",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OwnerReplyAt",
                table: "Reviews",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EntityProposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    SubmittedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReferenceUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewedByAdminId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityProposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntityProposals_Users_SubmittedByUserId",
                        column: x => x.SubmittedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stores_OwnerId",
                table: "Stores",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_EntityUpdateRequests_SubmittedByUserId",
                table: "EntityUpdateRequests",
                column: "SubmittedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EntityProposals_EntityType",
                table: "EntityProposals",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_EntityProposals_Status",
                table: "EntityProposals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EntityProposals_SubmittedByUserId",
                table: "EntityProposals",
                column: "SubmittedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EntityUpdateRequests_Users_SubmittedByUserId",
                table: "EntityUpdateRequests",
                column: "SubmittedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Stores_Users_OwnerId",
                table: "Stores",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EntityUpdateRequests_Users_SubmittedByUserId",
                table: "EntityUpdateRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Stores_Users_OwnerId",
                table: "Stores");

            migrationBuilder.DropTable(
                name: "EntityProposals");

            migrationBuilder.DropIndex(
                name: "IX_Stores_OwnerId",
                table: "Stores");

            migrationBuilder.DropIndex(
                name: "IX_EntityUpdateRequests_SubmittedByUserId",
                table: "EntityUpdateRequests");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "OwnerReply",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "OwnerReplyAt",
                table: "Reviews");
        }
    }
}
