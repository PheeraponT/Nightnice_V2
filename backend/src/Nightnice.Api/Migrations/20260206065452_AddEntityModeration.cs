using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nightnice.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityModeration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EntityClaims",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EvidenceUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ReviewedByAdminId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntityClaims_Users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EntityUpdateRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmittedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    ProofMediaUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ExternalProofUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ReviewedByAdminId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityUpdateRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EntityVerificationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityVerificationLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EntityClaims_EntityType_EntityId",
                table: "EntityClaims",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_EntityClaims_RequestedByUserId",
                table: "EntityClaims",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EntityClaims_Status",
                table: "EntityClaims",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EntityUpdateRequests_EntityType_EntityId",
                table: "EntityUpdateRequests",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_EntityUpdateRequests_Status",
                table: "EntityUpdateRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EntityVerificationLogs_CreatedAt",
                table: "EntityVerificationLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_EntityVerificationLogs_EntityType_EntityId",
                table: "EntityVerificationLogs",
                columns: new[] { "EntityType", "EntityId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntityClaims");

            migrationBuilder.DropTable(
                name: "EntityUpdateRequests");

            migrationBuilder.DropTable(
                name: "EntityVerificationLogs");
        }
    }
}
